from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
import hmac
import hashlib
import subprocess
import logging
from typing import Optional

app = FastAPI()
WEBHOOK_SECRET = "onepiece"  # 需与GitHub Webhook配置的Secret一致
DIR = "/data/PlayableAds-All"
LOG_FILE = DIR + "/webhook_deploy.log"

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def verify_signature(payload: bytes, signature: str) -> bool:
    """验证GitHub Webhook签名"""
    digest = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={digest}", signature)

async def execute_deployment():
    """执行部署流程"""
    try:
        # 1. 拉取最新代码
        logger.info("Pulling latest code...")
        pull_cmd = ["git", "-C", DIR, "pull", "origin", "main"]
        result = subprocess.run(pull_cmd, check=True, capture_output=True, text=True)
        logger.info(f"Git pull output: {result.stdout}")
        
        # 2. 运行部署脚本
        logger.info("Running deployment script...")
        deploy_script = f"{DIR}/deploy.sh"
        deploy_cmd = ["bash", deploy_script]
        result = subprocess.run(deploy_cmd, check=True, capture_output=True, text=True)
        logger.info(f"Deployment script output: {result.stdout}")
        
        logger.info("Deployment completed successfully")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr if e.stderr else e.stdout
        logger.error(f"Deployment failed: {error_msg}")
        raise

@app.post("/webhook")
async def github_webhook(
    request: Request, 
    background_tasks: BackgroundTasks
):
    # 验证签名
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature or not verify_signature(await request.body(), signature):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    # 解析事件类型
    event_type = request.headers.get("X-GitHub-Event")
    payload = await request.json()
    
    # 仅处理main分支的push事件
    if event_type == "push" and payload.get("ref") == "refs/heads/main":
        background_tasks.add_task(execute_deployment)  # 异步执行部署
        return {"status": "Deployment triggered"}
    
    return {"status": "Event ignored"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)